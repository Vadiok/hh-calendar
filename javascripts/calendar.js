jQuery(function() {


/* События */
var events = {
	'2013-8': {
		1: {
			'name': 'День знаний'
			,'members': 'Петр Иванов, Сидор Петров, Иван Сидоров'
		}
		,7: {
			'name': 'Еще одно событие'
			,'members': 'Петр Иванов, Сидор Петров, Иван Сидоров'
		}
		,20: {
			'name': 'Событие номер 3'
			,'members': 'Петр Иванов, Сидор Петров, Иван Сидоров'
		}
	}
};


/* Массив с названиями месяцев в род. падеже */
month_relative_names = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];


/* Календарь */

function setDate(desireddate) {

	// Массивы названий меяцев / дней недели
	var month_names = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
	var week_names = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
	// Текущие год и месяц
	var year = desireddate.getFullYear();
	var month = desireddate.getMonth();
	// Крайние дни и общее число дней месяца
	var day_first = new Date(year, month, 1);
	var day_last = new Date(year, month+1, 0);
	var days_total = day_last.getDate();
	// Дни недели крайних дней (1->пн. .. 7->вс.)
	var day_first_weeknum = day_first.getDay();
	var day_last_weeknum = day_last.getDay();
	if (day_first_weeknum == 0) day_first_weeknum = 7;
	if (day_last_weeknum == 0) day_last_weeknum = 7;
	// Количество строк таблицы в месяце (к-во недель, включая неполные)
	// Для недели, начинающейся с Вс.==0 было бы
	// (days_total+day_first_weeknum+6-day_last_weeknum)/7;
	var rows = (days_total + day_first_weeknum - 1 + 7 - day_last_weeknum) / 7;

	// Содержимое таблицы
	var table_content = '<tr>';

	// 1-я строка календаря (с днями недели)
	var day_i = new Date(year, month, (-day_first_weeknum+2));
	for (var i=1; i <= 7; i++) {
		table_content+= '<td>'+
				'<div id="calday-'+day_i.getFullYear()+'-'+day_i.getMonth()+'-'+day_i.getDate()+'" class="day">'+
					'<span class="date"><span class="weekday">'+week_names[i]+'</span>, <span class="num">'+ day_i.getDate() +'</span></span>'+
				'</div>'+
			'</td>';
		day_i.setDate(day_i.getDate()+1);
	};
	table_content+='</tr>';
	// Следующие строки календаря (2+)
	for (var j=2; j<=rows; j++) {
		table_content+='<tr>';
		for (var i=1; i <= 7; i++) {
			table_content+= '<td>'+
					'<div id="calday-'+day_i.getFullYear()+'-'+day_i.getMonth()+'-'+day_i.getDate()+'" class="day">'+
						'<span class="date num">'+ day_i.getDate() +'</span>'+
					'</div>'+
				'</td>';
			day_i.setDate(day_i.getDate()+1);
		};
		table_content+='</tr>';
	};

	// Вывод данных
	$('#month_name').text(month_names[month]+' '+year);
	$('#calendar').html(table_content);

	// Размеры ячеек таблицы
	var margin_bottom = 64;
	$('div.day').css('height', ($(window).height() - $('#calendar').offset().top - margin_bottom)/rows );
	var windowHeight = $(window).height();

	// Добавление событий к месяцу
	if ( (events[(year+'-'+month)]) !== undefined) {
		var month_events = events[(year+'-'+month)];
		for (var key in month_events) {
			var events_day = month_events[key];
			$('#calday-'+year+'-'+month+'-'+key).addClass('event').append(
				'<span class="name">'+events_day['name']+'</span>'+
				'<span class="participants">'+events_day['members']+'</span>'
			);
		}
	};


	// Выделение сегодняшнего дня
	var today = new Date();
	$('#calday-'+today.getFullYear()+'-'+today.getMonth()+'-'+today.getDate()).addClass('today');

	// Добавление года ко всем формам
	$('input[name="event_year"]').val(day_i.getFullYear());
}

// Текущий день/месяц при загрузке и клике на кнопку "Сегодня"
var cur_date = new Date();
$(window).load(function() {setDate(cur_date);});
$('#show_today').click(function() {
	hidePopovers();
	cur_date = new Date();
	setDate(cur_date);
	return false;
});

// Листание месяцев
$('#month_prev').click(function() {
	hidePopovers();
	cur_date.setMonth( cur_date.getMonth() - 1 );
	setDate(cur_date);
	return false;
});
$('#month_next').click(function() {
	hidePopovers();
	cur_date.setMonth( cur_date.getMonth() + 1 );
	setDate(cur_date);
	return false;
});



/* Поле поиска */
$('.search_popover').css('left', ($('#search_query_input').offset().left));
// Очистка поля
$('#search_query_input').focus(function(){hidePopovers();}).keyup(function() {
	if ( $(this).val().length > 0 ) {
		$('.search_popover').fadeIn();
		$(this).siblings('.input_reset').fadeIn();
	}
	else {
		$(this).siblings('.input_reset').fadeOut();
	}
});
$(window).load(function() {
	if ( $('#search_query_input').val().length > 0 ) {
		$('#search_query_input').siblings('.input_reset').show();
	};
});
$('.input_reset').click(function() {
	hidePopovers();
	$(this).hide();
});



/* Клик на дне */
$('#calendar').on('click', 'div.day', function() {

	// Отметка ячейки
	$('div.day').removeClass('marked');
	$(this).addClass('marked');

	// Всплывающие окна с новым событием / редактированием
	hidePopovers();
	var dayevent_popover = $('.dayevent_popover');
	event_date = $(this).attr('id').split(/-/);
	dayevent_popover.find('input[name="event_date"]').val(event_date[3]+' '+month_relative_names[(event_date[2])]+' '+event_date[1]+' года');
	var dayevent_popover_width = dayevent_popover.outerWidth();
	var dayevent_popover_height = dayevent_popover.outerHeight();
	var day_width = $(this).outerWidth();
	var day_pos = $(this).offset();
	var day_pos_top = day_pos.top;
	var dayevent_popover_leftpos, dayevent_popover_toppos;
	if ( ($(window).height() - day_pos_top) < dayevent_popover_height ) {
		dayevent_popover_leftpos = day_pos.left - 25;
		dayevent_popover_toppos = day_pos_top - dayevent_popover_height - 10;
		dayevent_popover.removeClass('popover_left').removeClass('popover_right').addClass('popover_top');
	}
	else if ( ($(window).width() - day_pos.left - day_width) < dayevent_popover_width) {
		dayevent_popover_leftpos = day_pos.left - dayevent_popover_width - 10;
		dayevent_popover_toppos = day_pos_top - 10;
		dayevent_popover.removeClass('popover_right').removeClass('popover_top').addClass('popover_left');
	}
	else {
		dayevent_popover_leftpos = day_pos.left + $(this).outerWidth() + 10;
		dayevent_popover_toppos = day_pos_top - 10;
		dayevent_popover.removeClass('popover_left').removeClass('popover_top').addClass('popover_right');
	};
	dayevent_popover.css({
			'left': dayevent_popover_leftpos,
			'top': dayevent_popover_toppos
		}).fadeIn(300);
	dePoShowStrings();

});


/* Клик на добавить */
$('#addevent').click(function() {
	hidePopovers();
	$(this).addClass('clicked');
	var addnew_popover_left = $(this).offset().left;
	var addnew_popover_top = $(this).offset().top + 38;
	$('.addnew_popover').css({
		'left': addnew_popover_left,
		'top': addnew_popover_top
	}).fadeIn(300);
	return false;
});


/* Клик на обновить */
$('#refresh').click(function() {
	hidePopovers();
	return false;
});


/* Всплывающие окна */

/* Исчезновение всплывающих окон и всего, что с ними связано */
var hidePopovers = function () {
	$('.popover').hide();
	$('.popover .inputs input').show();
	$('.popover .inputs .changeblock').hide();
	$('.popover form').trigger('reset');
	$('.clicked').removeClass('clicked');
}

/* Закрытие всплывающих окон */
$('.popover .close').click(function() {
	hidePopovers();
});

/* Обработка */
// Превращение инпутов в строки на .dayevent_popover
var dePoShowStrings = function () {
	var inp_data;
	$('.dayevent_popover .change input').each(function() {
		inp_data = $(this).val();
		if (inp_data.length>0) {
			$(this).hide().siblings('.changeblock').show().find('.changed_data').text(inp_data);
		};
	});
};
$('.dayevent_popover .change input').focusout(function() {
	dePoShowStrings();
});
// Превращение строк при клике в инпуты
$('.dayevent_popover .changeblock').click(function() {
	$(this).hide().siblings('input').show();
});

});